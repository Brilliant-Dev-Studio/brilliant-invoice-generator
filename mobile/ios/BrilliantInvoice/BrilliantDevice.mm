#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <Security/Security.h>
#import <UIKit/UIKit.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <PencilKit/PencilKit.h>
#import <PDFKit/PDFKit.h>
#import <Photos/Photos.h>

@interface SanPyaSignature : UIViewController
@property(nonatomic, strong) PKCanvasView *canvas;
@property(nonatomic, copy) RCTPromiseResolveBlock completion;
@end
@implementation SanPyaSignature
- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Draw your signature";
  self.view.backgroundColor = UIColor.whiteColor;
  self.canvas = [[PKCanvasView alloc] initWithFrame:self.view.bounds];
  self.canvas.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  self.canvas.drawingPolicy = PKCanvasViewDrawingPolicyAnyInput;
  self.canvas.tool = [[PKInkingTool alloc] initWithInkType:PKInkTypePen color:UIColor.blackColor width:3];
  self.canvas.backgroundColor = UIColor.whiteColor;
  [self.view addSubview:self.canvas];
  self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel target:self action:@selector(cancel)];
  self.navigationItem.rightBarButtonItems = @[
    [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemSave target:self action:@selector(save)],
    [[UIBarButtonItem alloc] initWithTitle:@"Clear" style:UIBarButtonItemStylePlain target:self action:@selector(clear)]];
}
- (void)clear { self.canvas.drawing = [PKDrawing new]; }
- (void)cancel { self.completion([NSNull null]); [self dismissViewControllerAnimated:YES completion:nil]; }
- (void)save {
  CGRect bounds = self.canvas.drawing.bounds;
  if (CGRectIsEmpty(bounds) || CGRectIsNull(bounds)) return;
  UIImage *image = [self.canvas.drawing imageFromRect:CGRectInset(bounds, -12, -12) scale:2];
  self.completion([UIImagePNGRepresentation(image) base64EncodedStringWithOptions:0]);
  [self dismissViewControllerAnimated:YES completion:nil];
}
@end

@interface SanPyaPDF : UIViewController
@property(nonatomic, strong) NSData *data;
@property(nonatomic, copy) RCTPromiseResolveBlock completion;
@end
@implementation SanPyaPDF
- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Invoice preview";
  PDFView *view = [[PDFView alloc] initWithFrame:self.view.bounds];
  view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  view.autoScales = YES;
  view.document = [[PDFDocument alloc] initWithData:self.data];
  [self.view addSubview:view];
  self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(close)];
}
- (void)close { self.completion(@YES); [self dismissViewControllerAnimated:YES completion:nil]; }
@end

@interface BrilliantDevice : NSObject <RCTBridgeModule, NSURLSessionTaskDelegate, UIDocumentPickerDelegate>
@property(nonatomic, copy) RCTPromiseResolveBlock imageResolve;
@property(nonatomic, copy) RCTPromiseRejectBlock imageReject;
@end
@implementation BrilliantDevice
RCT_EXPORT_MODULE();
+ (BOOL)requiresMainQueueSetup { return NO; }
- (NSDictionary *)key {
  return @{(__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
           (__bridge id)kSecAttrService: @"com.brilliantdevstudio.invoice.session",
           (__bridge id)kSecAttrAccount: @"workspace"};
}
RCT_REMAP_METHOD(loadSession, loadResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSMutableDictionary *query = [[self key] mutableCopy];
  query[(__bridge id)kSecReturnData] = @YES;
  CFTypeRef result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);
  if (status == errSecItemNotFound) { resolve([NSNull null]); return; }
  if (status != errSecSuccess) { reject(@"keychain", @"Unable to read secure session.", nil); return; }
  NSData *data = CFBridgingRelease(result);
  resolve([[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
}
RCT_REMAP_METHOD(saveSession, saveValue:(NSString *)value resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSData *data = [value dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *attributes = @{(__bridge id)kSecValueData: data,
    (__bridge id)kSecAttrAccessible: (__bridge id)kSecAttrAccessibleWhenUnlockedThisDeviceOnly};
  OSStatus status = SecItemUpdate((__bridge CFDictionaryRef)[self key], (__bridge CFDictionaryRef)attributes);
  if (status == errSecItemNotFound) {
    NSMutableDictionary *item = [[self key] mutableCopy];
    [item addEntriesFromDictionary:attributes];
    status = SecItemAdd((__bridge CFDictionaryRef)item, NULL);
  }
  if (status != errSecSuccess) {
    NSString *detail = CFBridgingRelease(SecCopyErrorMessageString(status, NULL));
    NSString *message = [NSString stringWithFormat:@"Unable to save secure session (%d). %@", (int)status, detail ?: @""];
    reject(@"keychain", message, [NSError errorWithDomain:NSOSStatusErrorDomain code:status userInfo:nil]);
    return;
  }
  resolve(@YES);
}
RCT_REMAP_METHOD(clearSession, clearResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)[self key]);
  if (status != errSecSuccess && status != errSecItemNotFound) {
    reject(@"keychain", @"Unable to clear secure session.", nil); return;
  }
  resolve(@YES);
}
RCT_REMAP_METHOD(uuid, uuidResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([NSUUID UUID].UUIDString.lowercaseString);
}
RCT_REMAP_METHOD(requestJson, requestOrigin:(NSString *)origin path:(NSString *)path token:(NSString *)token body:(NSString *)body
 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@/api/mobile/%@", origin, path]];
  BOOL secure = [url.scheme isEqualToString:@"https"];
#if DEBUG
  secure = secure || ([url.scheme isEqualToString:@"http"] &&
    ([url.host isEqualToString:@"localhost"] || [url.host isEqualToString:@"127.0.0.1"]));
#endif
  if (!secure) { reject(@"network", @"Use an HTTPS server.", nil); return; }
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  request.timeoutInterval = 30;
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  if (token.length) [request setValue:[@"Bearer " stringByAppendingString:token] forHTTPHeaderField:@"Authorization"];
  if (body) { request.HTTPMethod = @"POST"; request.HTTPBody = [body dataUsingEncoding:NSUTF8StringEncoding]; }
  NSURLSessionConfiguration *config = NSURLSessionConfiguration.ephemeralSessionConfiguration;
  config.HTTPCookieStorage = nil;
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil];
  [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    [session finishTasksAndInvalidate];
    if (error) { reject(@"network", @"Could not reach the workspace.", error); return; }
    id json = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:nil] : nil;
    resolve(@{@"status": @(((NSHTTPURLResponse *)response).statusCode), @"body": [json isKindOfClass:[NSDictionary class]] ? json : [NSNull null]});
  }] resume];
}
RCT_REMAP_METHOD(loadPreferences, preferencesResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSUserDefaults *defaults = NSUserDefaults.standardUserDefaults;
  resolve(@{@"locale": [defaults stringForKey:@"sanpya.locale"] ?: @"en", @"theme": [defaults stringForKey:@"sanpya.theme"] ?: @"light"});
}
RCT_REMAP_METHOD(savePreferences, preferencesLocale:(NSString *)locale theme:(NSString *)theme resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![@[@"en", @"my"] containsObject:locale] || ![@[@"light", @"dark", @"system"] containsObject:theme]) { reject(@"preferences", @"Invalid preferences.", nil); return; }
  [NSUserDefaults.standardUserDefaults setObject:locale forKey:@"sanpya.locale"];
  [NSUserDefaults.standardUserDefaults setObject:theme forKey:@"sanpya.theme"];
  resolve(@YES);
}
RCT_REMAP_METHOD(symbol, symbolName:(NSString *)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  UIImage *image = [UIImage systemImageNamed:name withConfiguration:[UIImageSymbolConfiguration configurationWithPointSize:24 weight:UIImageSymbolWeightMedium]];
  if (!image) { reject(@"symbol", @"Icon unavailable.", nil); return; }
  resolve([@"data:image/png;base64," stringByAppendingString:[UIImagePNGRepresentation(image) base64EncodedStringWithOptions:0]]);
}
RCT_REMAP_METHOD(pickImage, pickResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self.imageResolve) { reject(@"picker", @"An image picker is already open.", nil); return; }
    UIViewController *presenter = RCTPresentedViewController();
    if (!presenter) { reject(@"picker", @"No active screen.", nil); return; }
    self.imageResolve = resolve;
    self.imageReject = reject;
    UIDocumentPickerViewController *picker = [[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[UTTypePNG, UTTypeJPEG, UTTypeWebP] asCopy:YES];
    picker.delegate = self;
    [presenter presentViewController:picker animated:YES completion:nil];
  });
}
- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller {
  if (self.imageResolve) self.imageResolve([NSNull null]);
  self.imageResolve = nil; self.imageReject = nil;
}
- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls {
  NSURL *url = urls.firstObject;
  BOOL scoped = [url startAccessingSecurityScopedResource];
  NSNumber *size = nil;
  [url getResourceValue:&size forKey:NSURLFileSizeKey error:nil];
  NSData *data = size && size.unsignedLongLongValue <= 2800000 ? [NSData dataWithContentsOfURL:url] : nil;
  if (scoped) [url stopAccessingSecurityScopedResource];
  if (!data.length) self.imageReject(@"image", @"Choose a PNG, JPEG or WebP image under 2.8 MB.", nil);
  else self.imageResolve([data base64EncodedStringWithOptions:0]);
  self.imageResolve = nil; self.imageReject = nil;
}
RCT_REMAP_METHOD(drawSignature, signatureResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (!presenter) { reject(@"signature", @"No active screen.", nil); return; }
    SanPyaSignature *canvas = [SanPyaSignature new];
    canvas.completion = resolve;
    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:canvas];
    nav.modalPresentationStyle = UIModalPresentationFullScreen;
    [presenter presentViewController:nav animated:YES completion:nil];
  });
}

// Never forward a session token through an HTTP redirect.
- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
 willPerformHTTPRedirection:(NSHTTPURLResponse *)response newRequest:(NSURLRequest *)request
 completionHandler:(void (^)(NSURLRequest *))completionHandler { completionHandler(nil); }
RCT_REMAP_METHOD(sharePdf, shareOrigin:(NSString *)origin token:(NSString *)token invoiceId:(NSString *)invoiceId preview:(BOOL)preview
 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![[NSUUID alloc] initWithUUIDString:invoiceId]) { reject(@"pdf", @"Invalid invoice.", nil); return; }
  NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@/api/mobile/invoices/%@/pdf", origin, invoiceId]];
  BOOL secure = [url.scheme isEqualToString:@"https"];
#if DEBUG
  secure = secure || ([url.scheme isEqualToString:@"http"] &&
    ([url.host isEqualToString:@"localhost"] || [url.host isEqualToString:@"127.0.0.1"]));
#endif
  if (!secure) { reject(@"pdf", @"Use an HTTPS server.", nil); return; }
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  [request setValue:[@"Bearer " stringByAppendingString:token] forHTTPHeaderField:@"Authorization"];
  request.timeoutInterval = 90;
  NSURLSessionConfiguration *config = NSURLSessionConfiguration.ephemeralSessionConfiguration;
  config.HTTPCookieStorage = nil;
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil];
  [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    [session finishTasksAndInvalidate];
    if (error) { reject(@"pdf", @"Could not download PDF. Check your connection.", error); return; }
    if (((NSHTTPURLResponse *)response).statusCode != 200 || ![response.MIMEType isEqualToString:@"application/pdf"]) {
      reject(@"pdf", @"PDF unavailable. Refresh your session and try again.", nil); return;
    }
    if (preview) {
      dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *presenter = RCTPresentedViewController();
        if (!presenter) { reject(@"pdf", @"No active screen.", nil); return; }
        SanPyaPDF *viewer = [SanPyaPDF new];
        viewer.data = data; viewer.completion = resolve;
        UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:viewer];
        nav.modalPresentationStyle = UIModalPresentationFullScreen;
        [presenter presentViewController:nav animated:YES completion:nil];
      });
      return;
    }
    NSURL *folder = [[NSURL fileURLWithPath:NSTemporaryDirectory()] URLByAppendingPathComponent:[NSUUID UUID].UUIDString];
    NSError *fileError = nil;
    [[NSFileManager defaultManager] createDirectoryAtURL:folder withIntermediateDirectories:YES attributes:nil error:&fileError];
    NSURL *file = [folder URLByAppendingPathComponent:@"Brilliant-Invoice.pdf"];
    if (fileError || ![data writeToURL:file options:NSDataWritingAtomic | NSDataWritingFileProtectionComplete error:&fileError]) {
      reject(@"pdf", @"Could not prepare PDF for sharing.", fileError); return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
      UIViewController *presenter = RCTPresentedViewController();
      if (!presenter) { [[NSFileManager defaultManager] removeItemAtURL:folder error:nil]; reject(@"pdf", @"No active screen for sharing.", nil); return; }
      UIActivityViewController *sheet = [[UIActivityViewController alloc] initWithActivityItems:@[file] applicationActivities:nil];
      sheet.popoverPresentationController.sourceView = presenter.view;
      sheet.popoverPresentationController.sourceRect = CGRectMake(CGRectGetMidX(presenter.view.bounds), CGRectGetMidY(presenter.view.bounds), 1, 1);
      sheet.completionWithItemsHandler = ^(UIActivityType type, BOOL completed, NSArray *items, NSError *shareError) {
        [[NSFileManager defaultManager] removeItemAtURL:folder error:nil];
        if (shareError) reject(@"pdf", @"Could not share PDF.", shareError); else resolve(@(completed));
      };
      [presenter presentViewController:sheet animated:YES completion:nil];
    });
  }] resume];
}
RCT_REMAP_METHOD(savePngToGallery, galleryOrigin:(NSString *)origin token:(NSString *)token invoiceId:(NSString *)invoiceId
 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![[NSUUID alloc] initWithUUIDString:invoiceId]) { reject(@"png", @"Invalid invoice.", nil); return; }
  NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@/api/mobile/invoices/%@/png", origin, invoiceId]];
  BOOL secure = [url.scheme isEqualToString:@"https"];
#if DEBUG
  secure = secure || ([url.scheme isEqualToString:@"http"] &&
    ([url.host isEqualToString:@"localhost"] || [url.host isEqualToString:@"127.0.0.1"]));
#endif
  if (!secure) { reject(@"png", @"Use an HTTPS server.", nil); return; }
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  [request setValue:[@"Bearer " stringByAppendingString:token] forHTTPHeaderField:@"Authorization"];
  request.timeoutInterval = 90;
  NSURLSessionConfiguration *config = NSURLSessionConfiguration.ephemeralSessionConfiguration;
  config.HTTPCookieStorage = nil;
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil];
  [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    [session finishTasksAndInvalidate];
    if (error) { reject(@"png", @"Could not download PNG. Check your connection.", error); return; }
    if (((NSHTTPURLResponse *)response).statusCode != 200) {
      reject(@"png", @"PNG unavailable. Refresh your session and try again.", nil); return;
    }
    NSString *mime = response.MIMEType ?: @"";
    if (![mime isEqualToString:@"image/png"]) {
      reject(@"png", @"PNG unavailable. Refresh your session and try again.", nil); return;
    }
    UIImage *image = [UIImage imageWithData:data];
    if (!image) { reject(@"png", @"Could not read invoice image.", nil); return; }
    void (^save)(void) = ^{
      [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{
        [PHAssetChangeRequest creationRequestForAssetFromImage:image];
      } completionHandler:^(BOOL success, NSError *saveError) {
        dispatch_async(dispatch_get_main_queue(), ^{
          if (saveError) reject(@"png", @"Could not save to your photo library.", saveError);
          else resolve(@(success));
        });
      }];
    };
    PHAuthorizationStatus status = [PHPhotoLibrary authorizationStatusForAccessLevel:PHAccessLevelAddOnly];
    if (status == PHAuthorizationStatusAuthorized || status == PHAuthorizationStatusLimited) {
      save();
      return;
    }
    if (status == PHAuthorizationStatusDenied || status == PHAuthorizationStatusRestricted) {
      reject(@"png", @"Photo library access is off. Enable it in Settings.", nil);
      return;
    }
    [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly handler:^(PHAuthorizationStatus updated) {
      if (updated == PHAuthorizationStatusAuthorized || updated == PHAuthorizationStatusLimited) save();
      else reject(@"png", @"Photo library access is required to save invoices.", nil);
    }];
  }] resume];
}
@end
